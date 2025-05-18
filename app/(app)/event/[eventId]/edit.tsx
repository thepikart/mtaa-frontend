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
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMode } from '@/hooks/useMode';
import EventService from '@/services/EventService';
import * as ImageManipulator from 'expo-image-manipulator';
import Footer from '@/components/Footer';
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dropdown } from 'react-native-element-dropdown';
import { useConfirmation } from "@/hooks/useConfirm";
import { useEventStore } from '@/stores/eventStore';

const GoogleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
/**
 * EditEventScreen
 *
 * Screen for editing an existing event.  
 * - Loads event data + photo on mount  
 * - Allows changing title, place, date/time, category, description, price, and photo  
 * - Geocodes place before saving  
 * - Supports updating (handleSave) and deleting (handleDelete)
 *
 * @component
 * @returns {JSX.Element}
 */
export default function EditEventScreen(): JSX.Element {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const mode = useMode();

  const { confirm, Confirmation } = useConfirmation();

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
  const [dateTime, setDateTime] = useState('');            // „HH:MM DD.MM.YYYY“
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [originalPhotoUri, setOriginalPhotoUri] = useState<string | null>(null); // ← nový

  useEffect(() => {
    (async () => {
      try {
        const evt = await EventService.getEventById(Number(eventId));
        const evtPhoto = await EventService.getEventPhoto(Number(eventId));

        setTitle(evt.name ?? evt.title ?? '');
        setPlace(evt.place);
        setLatitude(String(evt.latitude));
        setLongitude(String(evt.longitude));

        const d = new Date(evt.date);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const mo = String(d.getMonth() + 1).padStart(2, '0');
        const yy = d.getFullYear();
        setDateTime(`${hh}:${mm} ${dd}.${mo}.${yy}`);

        setCategory(evt.category);
        setDescription(evt.description ?? '');
        setPrice(String(evt.price ?? 0));

        setPhotoUri(evtPhoto ?? null);
        setOriginalPhotoUri(evtPhoto ?? null);
      } catch {
        Alert.alert('Error', 'Failed to load event.');
      }
    })();
  }, []);

/**
 * pickImage
 *
 * Requests gallery permissions if needed, lets the user pick & crop a photo,
 * then resizes/compresses it to max 600px width before storing its URI.
 *
 * @async
 * @function pickImage
 * @returns {Promise<void>}
 */
const pickImage = async (): Promise<void> => {
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

    const res = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!res.canceled) {
      const asset = res.assets[0];

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

  /**
 * handleSave
 *
 * Validates required fields (title, place, dateTime, category),  
 * checks dateTime format, geocodes `place` if needed,  
 * builds FormData (including new photo), and calls `updateEvent`.  
 * Shows success/failure alerts.
 *
 * @async
 * @function handleSave
 * @returns {Promise<void>}
 */
const handleSave = async (): Promise<void> => {
    if (!title || !place || !dateTime || !category) {
      Alert.alert('Missing data', 'Please fill in title, place, date/time and category.');
      return;
    }

    const re = /^([01]\d|2[0-3]):([0-5]\d)\s(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])\.(\d{4})$/;
    if (!re.test(dateTime)) {
      Alert.alert('Wrong format', 'Use “HH:MM DD.MM.YYYY”, e.g. “14:30 24.12.2026”.');
      return;
    }


    let lat: string, lon: string;
    try {
      const geo = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          place
        )}&key=${GoogleMapsApiKey}`
      ).then(r => r.json());

      if (geo.status !== 'OK' || !geo.results.length) {
        Alert.alert('Geocoding error', `Cannot geocode “${place}”.`);
        return;
      }
      lat = String(geo.results[0].geometry.location.lat);
      lon = String(geo.results[0].geometry.location.lng);
    } catch {
      Alert.alert('Network error', 'Failed to geocode place.');
      return;
    }


    const [time, dmy] = dateTime.split(' ');
    const [dd, mo, yyyy] = dmy.split('.');
    const isoDate = `${yyyy}-${mo.padStart(2, '0')}-${dd.padStart(2, '0')}T${time}:00Z`;


    const form = new FormData();
    form.append('title', title);
    form.append('place', place);
    form.append('latitude', lat);
    form.append('longitude', lon);
    form.append('date', isoDate);
    form.append('category', category.toLowerCase());
    form.append('description', description);
    form.append('price', price || '0');

    if (photoUri && photoUri !== originalPhotoUri) {
      const fn = photoUri.split('/').pop()!;
      const match = /\.(\w+)$/.exec(fn);
      const type = match ? `image/${match[1]}` : 'image/*';
      form.append('photo', { uri: photoUri, name: fn, type } as any);
    }


    try {
      const ok = await confirm('Do you want to save the changes?');
      if (!ok) return;
      await EventService.updateEvent(Number(eventId), form);
      Alert.alert('Saved', 'Event updated successfully.');
      router.push(`/event/${eventId}`);
    } catch (err: any) {
      console.error('Update error', err?.response?.data || err);
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to save changes.';
      Alert.alert('Error', msg);
    }
  };


  const handleDelete = async () => {
    const ok = await confirm('Do you really want to delete this event?');
    if (!ok) return;
    try {
      const resp = await useEventStore.getState().deleteEvent(Number(eventId));
      if (!resp.success) {
        Alert.alert('Error', resp.message);
        return;
      }
      else {
        Alert.alert('Deleted', 'Event deleted successfully.');
        router.push('/my-events');
      }
    }
    catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to delete event.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: mode.background }}>
      <ScrollView contentContainerStyle={[styles.container]}>
        <Pressable
          onPress={pickImage}
          style={[
            styles.photoSlot,
            photoUri ? {} : { backgroundColor: '#ccc' },
          ]}
        >
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ color: '#666' }}>Add/change photo</Text>
          )}
        </Pressable>

        {/* --------- inputs --------- */}
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

        {/* --------- buttons --------- */}
        <View style={styles.buttonRow}>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Save Changes</Text>
          </Pressable>
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete Event</Text>
          </Pressable>
        </View>
      </ScrollView>
      <Footer />
      <Confirmation />
    </View>
  );
}

/* ──────────── styles ──────────── */
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  photoSlot: {
    width: '100%',
    height: 200,
    borderRadius: 6,
    marginBottom: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  multiline: { height: 100, textAlignVertical: 'top' },

  saveButton: {
    backgroundColor: '#4c8bf5',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    width: "40%",
    alignSelf: 'center',
  },
  saveText: { color: '#fff', fontWeight: '600' },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    width: "40%",
    alignSelf: 'center',
  },
  deleteText: { color: '#fff', fontWeight: '600' },
  text: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  }
});
