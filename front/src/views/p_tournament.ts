export function TournamentView(): string {
  return (document.getElementById("tournamenthtml") as HTMLTemplateElement).innerHTML;
}
