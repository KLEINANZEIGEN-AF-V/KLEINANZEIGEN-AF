# Sendora

Application Next.js de démonstration pour un parcours de transfert international avec intégration KKiaPay Sandbox et enregistrement Supabase.

## Déploiement

Importer le dossier/ZIP dans Vercel. Après le déploiement, ajouter les variables d'environnement nécessaires. Les clés secrètes ne doivent jamais être préfixées par `NEXT_PUBLIC_`.

## Version Auth Supabase
Cette version utilise Supabase Auth pour l'inscription/connexion et `profiles` pour les données expéditeur. Voir `SUPABASE-AUTH.sql` et `DEPLOIEMENT-VERSION-AUTH.md`.
