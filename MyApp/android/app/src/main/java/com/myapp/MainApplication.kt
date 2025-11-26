package com.myapp

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactNativeHost
import com.myapp.BuildConfig

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost = object : DefaultReactNativeHost(this) {
    override fun getPackages(): List<ReactPackage> =
      PackageList(this).packages.apply {
        // Manually add packages here if autolinking misses them.
        // add(MyReactNativePackage())
      }

    override fun getJSMainModuleName(): String = "index"
    override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
  }

  override fun onCreate() {
    super.onCreate()
    // No explicit loadReactNative() call needed for 0.81 template.
  }
}
