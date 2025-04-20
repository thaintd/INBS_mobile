import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { WebView } from "react-native-webview";

const { width, height } = Dimensions.get("window");

const TryAI: React.FC = () => {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: "https://192.168.199.92:5173/" }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        mixedContentMode="always"
        originWhitelist={["*"]}
        allowsInlineMediaPlayback={true}
        onShouldStartLoadWithRequest={() => true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error: ', nativeEvent);
        }}
        androidHardwareAccelerationDisabled={true}
        onContentProcessDidTerminate={reload => {
          console.log('Content process terminated, reloading...');
          reload();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  webview: {
    flex: 1,
    width: width,
    height: height
  }
});

export default TryAI;
