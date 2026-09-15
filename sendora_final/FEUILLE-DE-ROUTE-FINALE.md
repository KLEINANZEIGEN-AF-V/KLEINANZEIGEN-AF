# SENDORA — VERSION FINALE DE TRAVAIL

Cette archive regroupe la version la plus récente disponible du projet Sendora.

## Déjà intégré
- Authentification Supabase (inscription, connexion, session, déconnexion)
- Profil utilisateur et modification des informations
- Sécurité et changement de mot de passe
- Paramètres
- Sélecteur de langue (interface FR avec ouverture du choix)
- Bénéficiaires
- Transfert international France → Bénin et flux bénéficiaire/récapitulatif/confirmation
- Intégration KKiaPay Sandbox et vérification serveur
- Historique / Voir tout
- Administration
- Gestion des statuts : En attente, En traitement, Terminé, Annulé
- Préparation KYC

## À finaliser avant une mise en production réelle
- Prestataire KYC habilité et parcours documentaire réel
- Service de change et calcul des frais en temps réel
- Partenaires de paiement/remittance et couverture pays/réseaux
- Notifications de production si nécessaire
- Sécurité, conformité KYC/AML, antifraude et protection des données
- Tests complets puis passage des clés/providers Sandbox vers Production

## Important
La version actuelle reste une version de test/Sandbox pour les paiements. Aucun transfert réel ne doit être annoncé comme opérationnel tant que les partenaires, la conformité et les contrôles de production ne sont pas activés.

## KYC manuel ajouté
- Demande KYC depuis le profil utilisateur.
- File d'attente des demandes dans Administration.
- Statuts En attente / En cours / Vérifiée / Refusée.
- Motif de refus facultatif.
- Script Supabase : `SENDORA-KYC-MANUEL.sql`.
