import { useRef } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { WebView as WebViewType } from "react-native-webview";
import { WebView } from "react-native-webview";

const INSTAGRAM_DMS_URL = "https://www.instagram.com/direct/inbox";

const ALLOWED_URL_PATTERNS = [
  "/direct/",
  "/accounts/login",
  "/accounts/onetap",
];

const INJECT_JS = `
  (function() {
    function hideElements() {
      // Hide bottom nav bar
      const nav = document.querySelector('nav');
      if (nav) nav.style.display = 'none';

      // Hide the left sidebar (desktop view)
      const sidebar = document.querySelector('aside');
      if (sidebar) sidebar.style.display = 'none';
    }

    // Run immediately
    hideElements();

    // Run again after a delay (Instagram loads dynamically)
    setTimeout(hideElements, 1500);
    setTimeout(hideElements, 3000);
  })();
  true; // required for Android WebView
`;

export default function HomeScreen() {
  const webViewRef = useRef<WebViewType>(null);

  const handleNavigationChange = (navState: { url: string }) => {
    const { url } = navState;
    const isAllowed = ALLOWED_URL_PATTERNS.some((pattern) =>
      url.includes(pattern),
    );

    if (!isAllowed) {
      // Block it - go back to DMs
      webViewRef.current?.goBack();
    }
  };

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
      />
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
});
