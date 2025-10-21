import { format, parseISO } from "date-fns";

export const formatDateTime = (isoString) => {
  if (!isoString) {
    return { formattedDate: "N/A", formattedTime: "N/A" };
  }
  const dateObj = parseISO(isoString); 

  const formattedDate = format(dateObj, "yyyy/MM/dd");
  const formattedTime = format(dateObj, "HH:mm:ss"); 

  return { formattedDate, formattedTime };
};
