"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icons";

const areas = ["All Hyderabad", "Banjara Hills", "Charminar", "Hitech City", "Jubilee Hills", "Kondapur", "Secunderabad"];

export function LocationPicker({ compact = false }: { compact?: boolean }) {
  const [area, setArea] = useState("All Hyderabad");
  useEffect(() => { queueMicrotask(() => setArea(localStorage.getItem("merapaan-area") || "All Hyderabad")); }, []);
  return <label className={compact ? "location-picker compact" : "location-picker"}><Icon name="pin"/><span>{compact ? "Location" : "Pickup near"}</span><select aria-label="Select pickup area" value={area} onChange={(event) => { setArea(event.target.value); localStorage.setItem("merapaan-area", event.target.value); }}>{areas.map((item) => <option key={item}>{item}</option>)}</select></label>;
}
