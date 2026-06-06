import { useEffect, useState, useCallback, useRef } from "react"
import { usePanoStore } from "@/store/panoStore"

interface DeviceOrientationEventWithPermission extends DeviceOrientationEvent {
  requestPermission?: () => Promise<string>
}

export function useDeviceOrientation() {
  const setGyroSupported = usePanoStore((s) => s.setGyroSupported)
  const gyroSupported = usePanoStore((s) => s.gyroSupported)
  const gyroEnabled = usePanoStore((s) => s.gyroEnabled)
  const setGyroEnabled = usePanoStore((s) => s.setGyroEnabled)
  const [permissionNeeded, setPermissionNeeded] = useState(false)
  const alphaRef = useRef(0)
  const betaRef = useRef(0)
  const gammaRef = useRef(0)

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (e.alpha !== null) alphaRef.current = e.alpha
    if (e.beta !== null) betaRef.current = e.beta
    if (e.gamma !== null) gammaRef.current = e.gamma
  }, [])

  const requestPermission = useCallback(async () => {
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>
    }
    if (typeof DOE.requestPermission === "function") {
      try {
        const result = await DOE.requestPermission()
        if (result === "granted") {
          window.addEventListener("deviceorientation", handleOrientation)
          setGyroEnabled(true)
          setPermissionNeeded(false)
        }
      } catch {
        setGyroSupported(false)
      }
    }
  }, [handleOrientation, setGyroEnabled, setGyroSupported])

  useEffect(() => {
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>
    }

    if (!("DeviceOrientationEvent" in window)) {
      setGyroSupported(false)
      return
    }

    if (typeof DOE.requestPermission === "function") {
      setPermissionNeeded(true)
      setGyroSupported(true)
      return
    }

    const testHandler = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null || e.beta !== null || e.gamma !== null) {
        setGyroSupported(true)
        setGyroEnabled(true)
        window.addEventListener("deviceorientation", handleOrientation)
      } else {
        setGyroSupported(false)
      }
      window.removeEventListener("deviceorientation", testHandler)
    }

    window.addEventListener("deviceorientation", testHandler)

    const timer = setTimeout(() => {
      window.removeEventListener("deviceorientation", testHandler)
      if (gyroSupported === null) {
        setGyroSupported(false)
      }
    }, 2000)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("deviceorientation", handleOrientation)
      window.removeEventListener("deviceorientation", testHandler)
    }
  }, [handleOrientation, setGyroSupported, gyroSupported])

  return {
    gyroSupported,
    gyroEnabled,
    permissionNeeded,
    requestPermission,
    alpha: alphaRef.current,
    beta: betaRef.current,
    gamma: gammaRef.current,
  }
}
