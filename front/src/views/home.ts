export function View(): string {
  return (document.getElementById("html") as HTMLTemplateElement).innerHTML;
}

export async function init()
{
}