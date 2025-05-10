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

import Constants from "expo-constants";

const GoogleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export default function CreateEventScreen() {
  const connected = useSystemStore((state) => state.connected);
  const mode = useMode();
  const router = useRouter();

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
          resize: { width: 600},
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
      Alert.alert('Chýbajú údaje', 'Vyplň aspoň názov, miesto, dátum a kategóriu.');
      return;
    }

    const regex =
      /^([01]\d|2[0-3]):([0-5]\d)\s(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])\.(\d{4})$/;
    if (!regex.test(dateTime)) {
      Alert.alert('Formát dátumu', 'Použi formát „HH:MM DD.MM.YYYY“ – napr. „14:30 24.12.2026“');
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
        setPhotoUri(null);
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
        router.back();
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
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: mode.background }]}>
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

      <TextInput
        style={[styles.input, { color: mode.text, borderColor: mode.border }]}
        placeholder="Title"
        placeholderTextColor={mode.textPlaceholder}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { color: mode.text, borderColor: mode.border }]}
        placeholder="Place"
        placeholderTextColor={mode.textPlaceholder}
        value={place}
        onChangeText={setPlace}
      />
      <TextInput
        style={[styles.input, { color: mode.text, borderColor: mode.border }]}
        placeholder="14:30 24.12.2026"
        placeholderTextColor={mode.textPlaceholder}
        value={dateTime}
        onChangeText={setDateTime}
      />
      <TextInput
        style={[styles.input, { color: mode.text, borderColor: mode.border }]}
        placeholder="Category (music, art, sports...)"
        placeholderTextColor={mode.textPlaceholder}
        value={category}
        onChangeText={setCategory}
      />
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
      <TextInput
        style={[styles.input, { color: mode.text, borderColor: mode.border }]}
        placeholder="Price (0 = free)"
        placeholderTextColor={mode.textPlaceholder}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={{ color: '#fff' }}>Create event</Text>
      </Pressable>
    </ScrollView>
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
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 40,
  },
});
