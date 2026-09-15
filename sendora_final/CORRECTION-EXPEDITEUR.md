# Correction des informations de l'expéditeur

Cette version corrige l'enregistrement des informations de l'expéditeur.

- Les informations saisies lors de la création du compte (nom, téléphone, e-mail) sont conservées localement sur l'appareil.
- Elles sont rechargées automatiquement au prochain chargement de Sendora.
- Le bouton de transfert vérifie que ces informations existent avant de lancer un transfert.
- Lors de la confirmation KKiaPay, ces trois champs sont envoyés à `/api/kkiapay/confirm`.
- L'API serveur les enregistre dans `sendora_transfers.sender_name`, `sender_phone` et `sender_email`.

Important : cette version reste un prototype. Avant les transferts réels, il faut remplacer ce profil local par une vraie authentification/profil serveur et conserver les contrôles KYC/AML et de sécurité appropriés.


## Correction KKiaPay du 13/09/2026
Le montant envoyé à KKiaPay est calculé sur le montant total saisi (`amountNumber * taux`). Les frais Sendora sont déjà inclus dans ce montant saisi ; ils ne doivent donc pas être ajoutés une deuxième fois. KKiaPay peut ensuite appliquer ses propres frais de paiement côté client.
