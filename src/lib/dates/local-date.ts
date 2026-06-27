const appTimeZone = "Asia/Manila";

export function appDateInputValue(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: appTimeZone,
    year: "numeric",
  }).formatToParts(date);
  const valueByType = new Map(parts.map((part) => [part.type, part.value]));

  return [
    valueByType.get("year"),
    valueByType.get("month"),
    valueByType.get("day"),
  ].join("-");
}
