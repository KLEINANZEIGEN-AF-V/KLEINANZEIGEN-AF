# KYC manuel Sendora

Cette version ajoute une demande de vérification d'identité traitée manuellement par l'administration Sendora.

## Installation Supabase

Dans Supabase → SQL Editor → New query, exécuter le contenu de `SENDORA-KYC-MANUEL.sql`.

## Fonctionnement

- L'utilisateur ouvre Profil → Vérifier mon identité.
- Il envoie une demande.
- L'administration ouvre Administration → Vérifications d’identité.
- Statuts : En attente, En cours, Vérifiée, Refusée.
- En cas de refus, l'administrateur peut saisir un motif.
- L'utilisateur peut voir le statut dans son profil.

Important : cette fonction est une validation manuelle interne. Elle ne constitue pas, à elle seule, une conformité KYC/AML complète pour un service de transfert d'argent réel. Avant production, Sendora doit mettre en place les contrôles et partenaires réglementaires appropriés.
