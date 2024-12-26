export const hasRequiredClasses = (guild: any) => {
  const classes = guild.players.map((p: any) => p.class);
  return (
    classes.includes('Clérigo') &&
    classes.includes('Guerreiro') &&
    (classes.includes('Mago') || classes.includes('Arqueiro'))
  );
};