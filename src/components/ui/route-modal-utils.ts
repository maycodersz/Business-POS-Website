export function buildModalCloseHref(pathname: string, search: string) {
  const params = new URLSearchParams(search);
  params.delete("add");
  params.delete("batch");

  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ""}`;
}
