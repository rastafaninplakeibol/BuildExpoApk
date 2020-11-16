# BuildExpoApk

It is a tool i made to build an Expo APK locally, without using the cloud service and avoiding to wait even hours in the queue to build just a test APK.

In order to use it you need to have:
  1) an expo account 
  2) python3 installed
  3) the expo-cli and turtle-cli packages installed
  4) your own keystore files fetched from the expo-cli
  
To fetch the keystore you have to launch this command from terminal: $expo fetch:android:keystore
It writes keystore to PROJECT_DIR/PROJECT_NAME.jks and prints passwords to stdout. It is VERY important to save these passwords, as you need them later to fill the expo_data.json file.
