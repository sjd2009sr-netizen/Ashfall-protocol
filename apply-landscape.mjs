import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 1. Scaffold the native Gradle Android project with Capacitor if not already present
if (!fs.existsSync(path.resolve('android'))) {
  console.log('Scaffolding Android Gradle project via Capacitor...');
  execSync('npx cap add android', { stdio: 'inherit' });
}

// 2. Apply Gradle properties template
const gradleTemplatePath = path.resolve('android-config/gradle.properties');
const gradleTargetPath = path.resolve('android/gradle.properties');
if (fs.existsSync(gradleTemplatePath) && fs.existsSync(path.resolve('android'))) {
  const extraProps = fs.readFileSync(gradleTemplatePath, 'utf8');
  const currentProps = fs.existsSync(gradleTargetPath) ? fs.readFileSync(gradleTargetPath, 'utf8') : '';
  if (!currentProps.includes('Ashfall Protocol Android Gradle settings')) {
    fs.writeFileSync(gradleTargetPath, currentProps.trimEnd() + '\n\n' + extraProps, 'utf8');
    console.log('Applied Gradle properties.');
  }
}

// 3. Lock orientation to sensorLandscape & add microphone permissions for WebRTC voice chat
const manifestPath = path.resolve('android/app/src/main/AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
  let xml = fs.readFileSync(manifestPath, 'utf8');
  if (!xml.includes('android:screenOrientation')) {
    xml = xml.replace(
      '<activity',
      '<activity android:screenOrientation="sensorLandscape" android:keepScreenOn="true"'
    );
  }
  const permissionsToAdd = [
    '<uses-permission android:name="android.permission.INTERNET" />',
    '<uses-permission android:name="android.permission.RECORD_AUDIO" />',
    '<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />',
    '<uses-feature android:name="android.hardware.microphone" android:required="false" />',
  ];
  const missing = permissionsToAdd.filter((tag) => !xml.includes(tag));
  if (missing.length > 0 && xml.includes('<application')) {
    xml = xml.replace('<application', missing.join('\n    ') + '\n\n    <application');
  }
  fs.writeFileSync(manifestPath, xml, 'utf8');
  console.log('Locked AndroidManifest.xml to sensorLandscape and configured microphone permissions.');
}

// 4. Enable sticky immersive fullscreen & WebRTC microphone permission grant in MainActivity.java
const mainActPath = path.resolve('android/app/src/main/java/com/ashfallprotocol/game/MainActivity.java');
if (fs.existsSync(mainActPath)) {
  const javaSrc = `package com.ashfallprotocol.game;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.PermissionRequest;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {
  private static final int REQ_RECORD_AUDIO = 4102;
  private PermissionRequest pendingAudioRequest = null;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    hideSystemUI();

    if (getBridge() != null && getBridge().getWebView() != null) {
      getBridge().getWebView().setWebChromeClient(new BridgeWebChromeClient(getBridge()) {
        @Override
        public void onPermissionRequest(final PermissionRequest request) {
          runOnUiThread(() -> {
            String[] resources = request.getResources();
            boolean wantsAudio = false;
            for (String res : resources) {
              if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(res)) {
                wantsAudio = true;
                break;
              }
            }
            if (!wantsAudio) {
              super.onPermissionRequest(request);
              return;
            }
            if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO)
                == PackageManager.PERMISSION_GRANTED) {
              request.grant(new String[]{ PermissionRequest.RESOURCE_AUDIO_CAPTURE });
            } else {
              pendingAudioRequest = request;
              ActivityCompat.requestPermissions(
                MainActivity.this,
                new String[]{ Manifest.permission.RECORD_AUDIO },
                REQ_RECORD_AUDIO
              );
            }
          });
        }
      });
    }
  }

  @Override
  public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    if (requestCode == REQ_RECORD_AUDIO && pendingAudioRequest != null) {
      if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
        pendingAudioRequest.grant(new String[]{ PermissionRequest.RESOURCE_AUDIO_CAPTURE });
      } else {
        pendingAudioRequest.deny();
      }
      pendingAudioRequest = null;
    }
  }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if (hasFocus) hideSystemUI();
  }

  private void hideSystemUI() {
    getWindow().getDecorView().setSystemUiVisibility(
      View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
        | View.SYSTEM_UI_FLAG_FULLSCREEN
    );
  }
}
`;
  fs.writeFileSync(mainActPath, javaSrc, 'utf8');
  console.log('Enabled immersive sticky fullscreen and WebRTC mic permissions in MainActivity.java.');
}
