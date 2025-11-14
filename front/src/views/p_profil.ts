export function ProfilView(): string {
  return (document.getElementById("profilhtml") as HTMLTemplateElement).innerHTML;
}
