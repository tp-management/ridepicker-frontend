import { useEffect, useState } from "react";

import AssistPreferencesCard from "./AssistPreferencesCard";
import { assistPreferencesService } from "@/lib/services/assistPreferencesService";

export default function LiveAssistPreferencesCard(props) {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (typeof assistPreferencesService.subscribe !== "function") return undefined;
    return assistPreferencesService.subscribe(() => {
      setRevision((value) => value + 1);
    });
  }, []);

  return <AssistPreferencesCard key={revision} {...props} />;
}
