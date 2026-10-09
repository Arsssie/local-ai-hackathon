import { useState } from "react";
import { View, Image, Text, StyleSheet, LayoutChangeEvent } from "react-native";
import { Detection } from "../ml/types";
import classes from "../data/classes.json";

type Props = {
  uri: string;
  detections: Detection[];
};

export default function DetectionImage({ uri, detections }: Props) {
  // natural image aspect ratio (width / height)
  const [ratio, setRatio] = useState(4 / 3);
  const [width, setWidth] = useState(0);

  // Load the real image size so the boxes line up with the photo
  Image.getSize(uri, (w, h) => {
    if (h > 0) setRatio(w / h);
  });

  function onLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width);
  }

  const height = width / ratio;

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <View style={{ width, height }}>
        <Image source={{ uri }} style={{ width, height }} resizeMode="cover" />
        {detections.map((d, i) => {
          const color = (classes as any)[d.label]?.color ?? "#9CA3AF";
          return (
            <View
              key={i}
              style={[
                styles.box,
                {
                  left: d.box.x * width,
                  top: d.box.y * height,
                  width: d.box.width * width,
                  height: d.box.height * height,
                  borderColor: color,
                },
              ]}
            >
              <Text style={[styles.tag, { backgroundColor: color }]}>
                {d.label} {Math.round(d.confidence * 100)}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  box: { position: "absolute", borderWidth: 3, borderRadius: 4 },
  tag: {
    position: "absolute",
    top: -22,
    left: -3,
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    textTransform: "capitalize",
    overflow: "hidden",
  },
});
