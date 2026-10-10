import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';

const CLOUD_URL = 'https://ais-dev-2e42z46tk7hzrdb74izux4-811975221543.asia-east1.run.app';
const DEFAULT_LOCAL_URL = 'http://192.168.1.100:3000';

export default function App() {
  const [currentUrl, setCurrentUrl] = useState(CLOUD_URL);
  const [inputLocalUrl, setInputLocalUrl] = useState(DEFAULT_LOCAL_URL);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const webViewRef = useRef(null);

  const handleReload = () => {
    setHasError(false);
    setIsLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleSwitchToCloud = () => {
    setHasError(false);
    setIsLoading(true);
    setCurrentUrl(CLOUD_URL);
    setIsSettingsOpen(false);
  };

  const handleApplyLocal = () => {
    let url = inputLocalUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url;
    }
    setHasError(false);
    setIsLoading(true);
    setCurrentUrl(url);
    setIsSettingsOpen(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* Top Mobile Bar with Quick Connection Indicator */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <View style={[styles.statusDot, currentUrl === CLOUD_URL ? styles.dotCloud : styles.dotLocal]} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            PicklePlay {currentUrl === CLOUD_URL ? '• Cloud Live' : '• Local Wi-Fi'}
          </Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleReload} style={styles.iconButton}>
            <Text style={styles.iconText}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsSettingsOpen(true)} style={styles.settingsButton}>
            <Text style={styles.settingsButtonText}>⚙️ Server</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main WebView */}
      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsBackForwardNavigationGestures={true}
          onLoadStart={() => {
            setIsLoading(true);
            setHasError(false);
          }}
          onLoadEnd={() => setIsLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            setIsLoading(false);
            setHasError(true);
            setErrorMessage(nativeEvent.description || 'Connection failed');
          }}
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={styles.loadingText}>Loading PicklePlay...</Text>
              <Text style={styles.loadingSubtext}>{currentUrl}</Text>
            </View>
          )}
        />

        {/* Error Fallback Screen */}
        {hasError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Connection Unreachable</Text>
            <Text style={styles.errorDescription}>
              Could not connect to {currentUrl}.{'\n\n'}
              {currentUrl !== CLOUD_URL
                ? 'Make sure "npm run dev" is running in VS Code on your PC and your phone is on the same Wi-Fi network.'
                : 'Please check your internet connection and try again.'}
            </Text>

            <View style={styles.errorActions}>
              <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
                <Text style={styles.buttonText}>Retry Connection</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cloudButton} onPress={handleSwitchToCloud}>
                <Text style={styles.buttonText}>Switch to Live Cloud URL</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Server Settings Modal */}
      <Modal visible={isSettingsOpen} transparent={true} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>PicklePlay Connection</Text>
            <Text style={styles.modalSubtitle}>
              Select where Expo Go connects to load your courts, matches, and tournaments.
            </Text>

            {/* Option 1: Live Cloud */}
            <TouchableOpacity
              style={[
                styles.serverOption,
                currentUrl === CLOUD_URL && styles.serverOptionActive,
              ]}
              onPress={handleSwitchToCloud}
            >
              <View style={styles.optionRow}>
                <Text style={styles.optionIcon}>☁️</Text>
                <View style={styles.optionDetails}>
                  <Text style={styles.optionTitle}>Live Cloud Server (Recommended)</Text>
                  <Text style={styles.optionDescription}>
                    Works immediately anywhere without PC IP or local Wi-Fi setup.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Option 2: Local Computer */}
            <View style={[styles.serverOption, currentUrl !== CLOUD_URL && styles.serverOptionActive]}>
              <View style={styles.optionRow}>
                <Text style={styles.optionIcon}>💻</Text>
                <View style={styles.optionDetails}>
                  <Text style={styles.optionTitle}>Local PC Development</Text>
                  <Text style={styles.optionDescription}>
                    Connects to your local VS Code dev server on port 3000.
                  </Text>
                </View>
              </View>

              <Text style={styles.inputLabel}>Enter your PC's IP Address:</Text>
              <TextInput
                style={styles.textInput}
                value={inputLocalUrl}
                onChangeText={setInputLocalUrl}
                placeholder="http://192.168.1.X:3000"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.inputHelp}>
                Find in terminal by typing: <Text style={styles.codeText}>ipconfig</Text>
              </Text>

              <TouchableOpacity style={styles.applyLocalButton} onPress={handleApplyLocal}>
                <Text style={styles.applyLocalText}>Connect to Local PC</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={() => setIsSettingsOpen(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerBar: {
    height: 48,
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotCloud: {
    backgroundColor: '#10b981',
  },
  dotLocal: {
    backgroundColor: '#38bdf8',
  },
  headerTitle: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '700',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 6,
  },
  iconText: {
    fontSize: 14,
  },
  settingsButton: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  settingsButtonText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#020617',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 14,
  },
  loadingSubtext: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
    maxWidth: '80%',
    textAlign: 'center',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 20,
  },
  errorIcon: {
    fontSize: 42,
    marginBottom: 12,
  },
  errorTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorDescription: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorActions: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cloudButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 16,
  },
  serverOption: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  serverOptionActive: {
    borderColor: '#10b981',
    backgroundColor: '#132435',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionDetails: {
    flex: 1,
  },
  optionTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  optionDescription: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  inputLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#020617',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
    color: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  inputHelp: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
  },
  codeText: {
    color: '#38bdf8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  applyLocalButton: {
    backgroundColor: '#0284c7',
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyLocalText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
});
