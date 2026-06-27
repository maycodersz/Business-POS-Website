export type RangeSliderItem = {
  key: string;
  label: string;
};

export function activeRangeIndex(items: RangeSliderItem[], activeKey: string) {
  const index = items.findIndex((item) => item.key === activeKey);
  return index >= 0 ? index : 0;
}

export function buildRangeHref(pathname: string, rangeKey: string) {
  const params = new URLSearchParams();
  params.set("range", rangeKey);
  return `${pathname}?${params.toString()}`;
}

