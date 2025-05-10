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
import Constants from 'expo-constants';
import * as ImageManipulator from 'expo-image-manipulator';


const GoogleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function EditEventScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const mode = useMode();


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
  }, [eventId]);


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

  /* ──────────── uloženie ──────────── */
  const handleSave = async () => {
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
      await EventService.updateEvent(Number(eventId), form);
      Alert.alert('Saved', 'Event updated successfully.');
      router.back();
    } catch (err: any) {
      console.error('Update error', err?.response?.data || err);
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to save changes.';
      Alert.alert('Error', msg);
    }
  };


  const handleDelete = () => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await EventService.deleteEvent(Number(eventId));
            router.push('/home');
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Failed to delete event.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: mode.background }]}>
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
        placeholder="HH:MM DD.MM.YYYY"
        placeholderTextColor={mode.textPlaceholder}
        value={dateTime}
        onChangeText={setDateTime}
      />
      <TextInput
        style={[styles.input, { color: mode.text, borderColor: mode.border }]}
        placeholder="Category"
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

      {/* --------- buttons --------- */}
      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save Changes</Text>
      </Pressable>
      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteText}>Delete Event</Text>
      </Pressable>
    </ScrollView>
  );
}

/* ──────────── styles ──────────── */
const styles = StyleSheet.create({
  container: { padding: 20 },
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
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveText: { color: '#fff', fontWeight: '600' },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 40,
  },
  deleteText: { color: '#fff', fontWeight: '600' },
});
