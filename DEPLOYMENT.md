# Mise en ligne — KLEINANZEIGEN-AF V2

## Étape 1 — Supabase
1. Créer un projet Supabase.
2. Exécuter `supabase/schema.sql` dans l’éditeur SQL.
3. Activer l’authentification e-mail.
4. Ajouter les variables Supabase dans `.env.local`.

## Étape 2 — KKiaPay
1. Créer/configurer le compte marchand KKiaPay.
2. Récupérer les clés appropriées.
3. Mettre la clé publique dans `NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY`.
4. Garder les clés privées uniquement côté serveur.
5. Implémenter la vérification serveur avant de marquer une commande comme payée.

## Étape 3 — E-mail
Connecter un fournisseur d’e-mail transactionnel.
Destination de notification prévue : `Sabrina.zidek@fn.de`.

## Étape 4 — Hébergement
Déployer le projet Next.js sur un hébergeur compatible, puis renseigner les variables d’environnement de production.

## Étape 5 — Sécurité
Avant ouverture publique:
- RLS Supabase activé
- politiques d’accès testées
- validation serveur des commandes
- vérification serveur des paiements
- protection anti-spam des messages/contact
- secrets uniquement côté serveur
- pages légales et politique de confidentialité adaptées au pays d’exploitation
