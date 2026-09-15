# Sendora — Bénéficiaires V1

Cette version ajoute :
- écran « Mes bénéficiaires » ;
- ajout d'un bénéficiaire depuis l'étape Bénéficiaire d'un transfert ;
- liste personnelle des bénéficiaires ;
- suppression d'un bénéficiaire ;
- accès depuis le profil et le tableau de bord.

## Avant le déploiement
1. Dans Supabase → SQL Editor → New query, exécuter `SENDORA-BENEFICIAIRES.sql`.
2. Déployer le projet sur Vercel.
3. Conserver les mêmes variables d'environnement que la version précédente.

Les bénéficiaires sont protégés par RLS : chaque utilisateur ne peut lire/modifier/supprimer que ses propres bénéficiaires.
