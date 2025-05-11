import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useMode } from '@/hooks/useMode';
import { useEventStore } from '@/stores/eventStore';
import { useSystemStore } from '@/stores/systemStore';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import * as ImageManipulator from 'expo-image-manipulator';
import Footer from '@/components/Footer';
import DateTimePicker from "@react-native-community/datetimepicker";
import Constants from "expo-constants";
import { Dropdown } from 'react-native-element-dropdown';

const GoogleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export default function CreateEventScreen() {
  const connected = useSystemStore((state) => state.connected);
  const mode = useMode();
  const router = useRouter();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const categories = [
    { label: 'politics', value: 'politics' },
    { label: 'sports', value: 'sports' },
    { label: 'music', value: 'music' },
    { label: 'technology', value: 'technology' },
    { label: 'art', value: 'art' },
    { label: 'other', value: 'other' },
  ]

  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [dateTime, setDateTime] = useState('');      // HH:MM DD.MM.YYYY
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const pickImage = async () => {
    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted' && !canAskAgain) {
      Alert.alert(
        "Permission Required",
        "Please enable gallery access in settings to add a photo.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => {
              Linking.openSettings();
            },
          },
        ]
      );
      return;
    }
    else if (status !== 'granted') {
      Alert.alert("Permission", "Gallery permission is required to add a photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      const manipulated = await ImageManipulator.manipulateAsync(
        asset.uri, [{
          resize: { width: 600 },
        }], {
        compress: 0.6,
        format: ImageManipulator.SaveFormat.JPEG,
      }
      );
      setPhotoUri(manipulated.uri);
    }
    else {
      setPhotoUri(null);
    }
  };

  const handleSubmit = async () => {
    if (!title || !place || !dateTime || !category) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }

    const regex =
      /^([01]\d|2[0-3]):([0-5]\d)\s(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])\.(\d{4})$/;
    if (!regex.test(dateTime)) {
      Alert.alert('Invalid date format', 'Please use HH:MM DD.MM.YYYY format.');
      return;
    }

    const [time, dmy] = dateTime.split(' ');
    const [dd, mm, yyyy] = dmy.split('.');
    const isoDate = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T${time}:00Z`;

    let lat = latitude;
    let lon = longitude;
    if (!lat || !lon) {
      if (connected) {
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=${GoogleMapsApiKey}`
          );
          const json = await res.json();
          if (json.status === 'OK' && json.results.length) {
            lat = String(json.results[0].geometry.location.lat);
            lon = String(json.results[0].geometry.location.lng);
          } else {
            Alert.alert('Geocoding failed', `Couldn't look up "${place}".`);
            return;
          }
        } catch (e) {
          Alert.alert('Network error', 'Could not geocode the place.');
          return;
        }
      }
      else {
        lat = "",
          lon = "";
      }
    }
    const data = new FormData();
    data.append('title', title);
    data.append('place', place);
    data.append('latitude', lat);
    data.append('longitude', lon);
    data.append('date', isoDate);
    data.append('category', category.toLowerCase());
    data.append('description', description);
    data.append('price', price || '0');

    if (photoUri) {
      const filename = photoUri.split('/').pop()!;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      data.append('photo', {
        uri: photoUri,
        name: filename,
        type,
      } as any);
    }

    if (connected) {
      const result = await useEventStore.getState().createEvent(data);
      if (!result.success) {
        crashlytics().recordError(new Error(result.message));
        Alert.alert('Error', result.message);
        return;
      }
      else {
        analytics().logEvent('event_created', {
          eventId: result.id,
          eventPrice: price,
          eventCategory: category.toLowerCase(),
        });
        Alert.alert('Success', 'Event created successfully!');
        router.push(`/event/${result.id}`);
      }
    }
    else {
      const plainData = {
        title,
        place,
        latitude: lat,
        longitude: lon,
        date: isoDate,
        category: category.toLowerCase(),
        description,
        price: price || '0',
        photoUri,
      };

      await useSystemStore.getState().addToOfflineQueue('createEvent', { data: plainData });
      Alert.alert('Offline mode', 'Event will be created when you are back online.');
      router.back();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: mode.background }}>
      <ScrollView contentContainerStyle={[styles.container]}>
        <Pressable
          onPress={pickImage}
          style={[
            styles.photoSlot,
            photoUri
              ? { backgroundColor: "transparent" }
              : { backgroundColor: "#ccc" },
          ]}
        >
          {photoUri
            ? (
              <Image
                source={{ uri: photoUri }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            )
            : (
              <Text style={{ color: "#666" }}>Add photo</Text>
            )
          }
        </Pressable>

        <Text style={[styles.text, { color: mode.text }]}>Title</Text>
        <TextInput
          style={[styles.input, { color: mode.text, borderColor: mode.border }]}
          placeholder="Title"
          placeholderTextColor={mode.textPlaceholder}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={[styles.text, { color: mode.text }]}>Place</Text>
        <TextInput
          style={[styles.input, { color: mode.text, borderColor: mode.border }]}
          placeholder="Place"
          placeholderTextColor={mode.textPlaceholder}
          value={place}
          onChangeText={setPlace}
        />

        <Text style={[styles.text, { color: mode.text }]}>Date and time</Text>
        <Pressable onPress={() => setShowDatePicker(true)}>
          <TextInput
            style={[styles.input, { color: mode.text, borderColor: mode.border }]}
            value={dateTime}
            editable={false}
            placeholder="HH:MM DD.MM.YYYY"
            placeholderTextColor={mode.textPlaceholder}
          />
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) {
                const updated = new Date(date);
                setSelectedDate(updated);
                setShowTimePicker(true);
              }
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            display="default"
            minimumDate={new Date()}
            onChange={(event, time) => {
              setShowTimePicker(false);
              if (time) {
                const updated = new Date(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth(),
                  selectedDate.getDate(),
                  time.getHours(),
                  time.getMinutes()
                );
                setSelectedDate(updated);

                const hh = String(updated.getHours()).padStart(2, '0');
                const mm = String(updated.getMinutes()).padStart(2, '0');
                const dd = String(updated.getDate()).padStart(2, '0');
                const mo = String(updated.getMonth() + 1).padStart(2, '0');
                const yy = updated.getFullYear();

                setDateTime(`${hh}:${mm} ${dd}.${mo}.${yy}`);
              }
            }}
          />
        )}

        <Text style={[styles.text, { color: mode.text }]}>Category</Text>
        <Dropdown
          style={[styles.input, { borderColor: mode.border, backgroundColor: mode.background }]}
          containerStyle={{
            backgroundColor: mode.background,
            borderColor: mode.border,
            borderWidth: 1,
          }}
          placeholderStyle={{ color: mode.textPlaceholder, fontSize: 14 }}
          selectedTextStyle={{ color: mode.text, fontSize: 14 }}
          itemTextStyle={{ color: mode.text, fontSize: 14 }}
          activeColor={mode.activeButton}
          data={categories}
          labelField="label"
          valueField="value"
          placeholder="Select category"
          value={category}
          onChange={item => setCategory(item.value)}
        />

        <Text style={[styles.text, { color: mode.text }]}>Description</Text>
        <TextInput
          style={[
            styles.input,
            styles.multiline,
            { color: mode.text, borderColor: mode.border },
          ]}
          placeholder="Description"
          placeholderTextColor={mode.textPlaceholder}
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Text style={[styles.text, { color: mode.text }]}>Price</Text>
        <TextInput
          style={[styles.input, { color: mode.text, borderColor: mode.border }]}
          placeholder="Price (0 = free)"
          placeholderTextColor={mode.textPlaceholder}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={{ color: '#fff', fontSize: 15 }}>Create event</Text>
        </Pressable>
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  photoSlot: {
    width: "100%",
    height: 200,
    borderRadius: 6,
    marginBottom: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  photoButton: {
    backgroundColor: '#4c8bf5',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  preview: {
    width: '100%',
    height: 180,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
    width: "50%",
    alignSelf: 'center',
  },
  text: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '500',
  },
});
