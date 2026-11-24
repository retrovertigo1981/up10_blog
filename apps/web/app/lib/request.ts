export function getPageFromRequest(request: Request) {
  const value = Number(new URL(request.url).searchParams.get("page") ?? "1");

  return Number.isInteger(value) && value > 0 ? value : 1;
}
