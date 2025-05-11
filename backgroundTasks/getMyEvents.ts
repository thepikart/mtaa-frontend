import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import EventService from '@/services/EventService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUND_TASK_ID = 'background-get-my-events';

TaskManager.defineTask(BACKGROUND_TASK_ID, async () => {
    try {
        await getMyEventsOffline();
        return BackgroundTask.BackgroundTaskResult.Success;
    }
    catch (error) {
        console.error("Background task error:", error);
        return BackgroundTask.BackgroundTaskResult.Failed;
    }
});

export async function registerBackgroundTask() {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_ID);
    if (isRegistered) {
        console.log("Task already registered.");
        return;
    }
    await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_ID, {
        minimumInterval: 60 * 24,
    });
    console.log("Task registered.");
}

const getMyEventsOffline = async () => {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);
  try {
    const response = await EventService.getMyEvents(startDate, endDate);
    const events = response.events;
    const storedEvents = await AsyncStorage.getItem('myEvents');
    if (storedEvents) {
      await AsyncStorage.removeItem('myEvents');
      await AsyncStorage.setItem('myEvents', JSON.stringify(events));
    }
    else {
      await AsyncStorage.setItem('myEvents', JSON.stringify(events));
    }
    console.log("Stored events", events);
  }
  catch (error) {
    console.error("Storing error", error);
  }
}