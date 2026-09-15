# Sendora — version Auth Supabase + KKiaPay

Cette version remplace le stockage du profil dans `localStorage` par Supabase Auth et la table `profiles`.

## Avant le déploiement
1. Dans Supabase > SQL Editor, exécuter `SUPABASE-AUTH.sql`.
2. Vérifier que l'authentification Email est activée dans Supabase Authentication.
3. Dans Vercel, conserver les variables déjà configurées :
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY
   - KKIAPAY_PRIVATE_KEY
   - KKIAPAY_SECRET_KEY
   - KKIAPAY_SANDBOX=true
4. Redéployer.

## Fonctionnement
- Inscription : création d'un compte Supabase Auth avec e-mail + mot de passe.
- Si la confirmation e-mail est requise, l'utilisateur doit confirmer son e-mail avant connexion.
- Profil : nom, téléphone et e-mail sont enregistrés dans `profiles`.
- Transfert : l'API récupère l'utilisateur authentifié et lit le profil côté serveur.
- Les champs expéditeur ne sont donc plus acceptés depuis le navigateur comme source d'autorité.
- La transaction KKiaPay est toujours vérifiée côté serveur avant l'enregistrement.

## Important
Cette version reste un environnement Sandbox tant que `KKIAPAY_SANDBOX=true`. Elle ne constitue pas à elle seule un service de transfert d'argent prêt pour la production : il faut notamment un partenaire de paiement/remittance autorisé, KYC/AML, contrôles antifraude, sécurité, protection des données et conformité réglementaire.
