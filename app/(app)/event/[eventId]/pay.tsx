import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useEventStore } from '@/stores/eventStore';
import { useUserStore } from '@/stores/userStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { formatDate } from '@/utils/date';
import { useConfirmation } from '@/hooks/useConfirm';
import { useMode } from '@/hooks/useMode';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

export default function PayScreen() {
  const mode = useMode();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const event = useEventStore((state) => state.eventToPay);
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { confirm, Confirmation } = useConfirmation();

  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiration, setExpiration] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // If there's no eventToPay or wrong ID, go back—*inside* useEffect, not render
  useEffect(() => {
    if (!event) {
      router.back();
    } else if (event.id !== Number(eventId)) {
      router.back();
    } else {
      setIsLoading(false);
    }
  }, [event, eventId, router]);

  const handlePayment = async () => {
    const ok = await confirm('Are you sure you want to pay for this event?');
    if (!ok) {
      analytics().logEvent('event_payment_cancelled', {
        eventId: event?.id,
        eventPrice: event?.price,
        eventCategory: event?.category,
      });
      return;
    }

    try {
      const data = {
        cardHolder: `${user?.name} ${user?.surname}`,
        cardNumber,
        cvv,
        expiration,
      };
      const resp = await useEventStore.getState().registerForEvent(event!.id, data);
      analytics().logEvent("event_registered", {
          eventId: event?.id,
          eventPrice: event?.price,
          eventCategory: event?.category,
        });
      if (!resp.success) throw new Error(resp.message);

      useEventStore.getState().setEventToPay(null);

      Alert.alert(
        'Success',
        'You have successfully registered for the event.',
        [
          {
            text: 'OK',
            onPress: () => {
              // return to the event screen
              router.back();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (err: any) {
      crashlytics().recordError(err);
      Alert.alert('Error', err?.message || 'Payment failed.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={mode.text} />
      </View>
    );
  }

  // safe-guard: should never get here without a valid `event`
  if (!event) {
    return null;
  }

  const imageUri = event.photo?.startsWith('http')
    ? event.photo
    : `${event.photo}`;

  return (
    <View style={[styles.outer, { backgroundColor: mode.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <View style={styles.info}>
            <Text style={[styles.title, { color: mode.text }]}>{event.name}</Text>
            <Text style={{ color: mode.text }}>
              {event.place}, {formatDate(event.date)}
            </Text>
            <Text style={[styles.desc, { color: mode.text }]} numberOfLines={3}>
              {event.description}
            </Text>
          </View>
        </View>
        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: mode.text }]}>Price:</Text>
          <Text style={[styles.priceValue, { color: mode.text }]}>
            {event.price} €
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: mode.text }]}>
            Payment Details
          </Text>

          <TextInput
            style={[styles.input, { borderColor: mode.borderInput, color: mode.text }]}
            value={`${user?.name} ${user?.surname}`}
            editable={false}
          />

          <TextInput
            style={[styles.input, { borderColor: mode.borderInput, color: mode.text }]}
            placeholder="Card number"
            placeholderTextColor={mode.textPlaceholder}
            keyboardType="number-pad"
            maxLength={16}
            value={cardNumber}
            onChangeText={setCardNumber}
          />

          <View style={styles.row}>
            <TextInput
              style={[
                styles.input,
                styles.smallInput,
                { borderColor: mode.borderInput, color: mode.text },
              ]}
              placeholder="CVV"
              placeholderTextColor={mode.textPlaceholder}
              keyboardType="number-pad"
              maxLength={3}
              value={cvv}
              onChangeText={setCvv}
            />
            <TextInput
              style={[
                styles.input,
                styles.smallInput,
                { borderColor: mode.borderInput, color: mode.text },
              ]}
              placeholder="MM/YY"
              placeholderTextColor={mode.textPlaceholder}
              maxLength={5}
              value={expiration}
              onChangeText={setExpiration}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
          <Text style={styles.payText}>Pay</Text>
        </TouchableOpacity>
      </ScrollView>
      <Confirmation />
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  outer: { flex: 1 },
  container: { padding: 20 },
  header: { flexDirection: 'row', marginBottom: 20 },
  image: { width: 100, height: 100, borderRadius: 8, marginRight: 12 },
  info: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600' },
  desc: { marginTop: 4, fontSize: 13 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  priceLabel: { fontSize: 16, fontWeight: '500' },
  priceValue: { fontSize: 16, fontWeight: '700' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  smallInput: { flex: 1, marginRight: 10 },
  row: { flexDirection: 'row' },
  payButton: {
    backgroundColor: '#14AE5C',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  payText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
