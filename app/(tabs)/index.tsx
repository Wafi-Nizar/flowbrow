import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  BackHandler,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { WebView as WebViewType } from "react-native-webview";
import { WebView } from "react-native-webview";

const INSTAGRAM_DMS_URL = "https://www.instagram.com/direct/inbox";

const ALLOWED_URL_PATTERNS = [
  "/direct/",
  "/accounts/login",
  "/accounts/onetap",
  "/p/",
];

const INJECT_JS = `
  (function() {
    function hideElements() {
      const nav = document.querySelector('nav');
      if (nav) nav.style.display = 'none';

      const sidebar = document.querySelector('aside');
      if (sidebar) sidebar.style.display = 'none';
    }

    function blockReelScrolling() {
      document.addEventListener('touchmove', function(e) {
        const mediaViewer = document.querySelector('[role="dialog"]') || 
                           document.querySelector('video');
        if (mediaViewer) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    hideElements();
    blockReelScrolling();
    setTimeout(hideElements, 1500);
    setTimeout(hideElements, 3000);
  })();
  true;
`;

export default function HomeScreen() {
  const webViewRef = useRef<WebViewType>(null);
  const [currentUrl, setCurrentUrl] = useState(INSTAGRAM_DMS_URL);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (webViewRef.current) {
            webViewRef.current.goBack();
            return true;
          }
          return false;
        },
      );
      return () => subscription.remove();
    }, []),
  );

  const handleNavigationChange = (navState: { url: string }) => {
    const { url } = navState;
    setCurrentUrl(url);

    const isAllowed = ALLOWED_URL_PATTERNS.some((pattern) =>
      url.includes(pattern),
    );

    if (!isAllowed) {
      webViewRef.current?.stopLoading();
      webViewRef.current?.goBack();
    }
  };

  const isOnInbox = currentUrl.includes("/direct/inbox");
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: INSTAGRAM_DMS_URL }}
        style={styles.webview}
        injectedJavaScript={INJECT_JS}
        onNavigationStateChange={handleNavigationChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
      />

      {isOnInbox && !isLoading && (
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => webViewRef.current?.reload()}
        >
          <Ionicons
            name="refresh"
            size={24}
            color={colorScheme === "dark" ? "#fff" : "#000"}
          />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  webview: {
    flex: 1,
  },
  refreshButton: {
    position: "absolute",
    top: 40,
    right: 50,
    zIndex: 999,
  },
});
