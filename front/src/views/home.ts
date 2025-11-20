export function HomeView(): string {
  return (document.getElementById("homehtml") as HTMLTemplateElement).innerHTML;
}
