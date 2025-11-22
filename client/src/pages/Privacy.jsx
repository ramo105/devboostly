import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { COMPANY_INFO } from '@/lib/constants'

function Privacy() {
  return (
    <div className="py-16">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-4xl font-bold">Politique de Confidentialité</h1>

          <div className="mb-8">
            <p className="text-muted-foreground">
              Cette politique de confidentialité décrit comment {COMPANY_INFO.name} collecte, utilise et protège les informations personnelles que vous nous fournissez.
            </p>
          </div>

          <div className="space-y-6">
            {/* Collecte des données */}
            <Card>
              <CardHeader>
                <CardTitle>1. Collecte des données personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Nous collectons les données personnelles suivantes :</p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Adresse postale (si fournie)</li>
                  <li>Informations relatives à votre projet</li>
                </ul>
                <p>
                  Ces informations sont collectées lors de votre inscription, de vos demandes de devis, ou lors de votre prise de contact via nos formulaires.
                </p>
              </CardContent>
            </Card>

            {/* Utilisation des données */}
            <Card>
              <CardHeader>
                <CardTitle>2. Utilisation des données</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Les données collectées sont utilisées pour :</p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>Gérer votre compte client</li>
                  <li>Traiter vos commandes et demandes de devis</li>
                  <li>Vous contacter concernant nos services</li>
                  <li>Améliorer nos services et votre expérience utilisateur</li>
                  <li>Respecter nos obligations légales</li>
                  <li>Vous envoyer des informations sur nos offres (avec votre consentement)</li>
                </ul>
              </CardContent>
            </Card>

            {/* Protection des données */}
            <Card>
              <CardHeader>
                <CardTitle>3. Protection des données</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles contre :
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>L'accès non autorisé</li>
                  <li>La perte accidentelle</li>
                  <li>La destruction ou l'altération</li>
                  <li>La divulgation non autorisée</li>
                </ul>
                <p>
                  Vos données sont stockées sur des serveurs sécurisés et l'accès est strictement limité aux personnes autorisées.
                </p>
              </CardContent>
            </Card>

            {/* Partage des données */}
            <Card>
              <CardHeader>
                <CardTitle>4. Partage des données</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Nous ne vendons, ne louons ni ne partageons vos données personnelles avec des tiers, sauf dans les cas suivants :
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>Avec votre consentement explicite</li>
                  <li>Pour respecter une obligation légale</li>
                  <li>Avec nos prestataires de services (hébergement, paiement) qui sont tenus par des obligations de confidentialité</li>
                  <li>En cas de fusion, acquisition ou vente d'actifs de notre entreprise</li>
                </ul>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle>5. Cookies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Notre site utilise des cookies pour améliorer votre expérience de navigation. Les cookies sont de petits fichiers texte stockés sur votre appareil.
                </p>
                <p>Types de cookies utilisés :</p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>
                    <strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site
                  </li>
                  <li>
                    <strong>Cookies de performance :</strong> Pour analyser l'utilisation du site
                  </li>
                  <li>
                    <strong>Cookies de préférence :</strong> Pour mémoriser vos préférences
                  </li>
                </ul>
                <p>
                  Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut affecter certaines fonctionnalités du site.
                </p>
              </CardContent>
            </Card>

            {/* Vos droits */}
            <Card>
              <CardHeader>
                <CardTitle>6. Vos droits (RGPD)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>
                    <strong>Droit d'accès :</strong> Vous pouvez demander l'accès à vos données personnelles
                  </li>
                  <li>
                    <strong>Droit de rectification :</strong> Vous pouvez demander la correction de données inexactes
                  </li>
                  <li>
                    <strong>Droit à l'effacement :</strong> Vous pouvez demander la suppression de vos données
                  </li>
                  <li>
                    <strong>Droit à la limitation :</strong> Vous pouvez demander la limitation du traitement
                  </li>
                  <li>
                    <strong>Droit à la portabilité :</strong> Vous pouvez recevoir vos données dans un format structuré
                  </li>
                  <li>
                    <strong>Droit d'opposition :</strong> Vous pouvez vous opposer au traitement de vos données
                  </li>
                </ul>
                <p>
                  Pour exercer ces droits, contactez-nous à :{' '}
                  <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">
                    {COMPANY_INFO.email}
                  </a>
                </p>
              </CardContent>
            </Card>

            {/* Durée de conservation */}
            <Card>
              <CardHeader>
                <CardTitle>7. Durée de conservation</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Vos données personnelles sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées, dans le respect des obligations légales et réglementaires applicables :
                </p>
                <ul className="list-disc space-y-2 pl-6 mt-4">
                  <li>Données de compte client : Pendant toute la durée de la relation contractuelle + 3 ans</li>
                  <li>Données de facturation : 10 ans (obligation légale)</li>
                  <li>Données de prospection : 3 ans à compter du dernier contact</li>
                </ul>
              </CardContent>
            </Card>

            {/* Modifications */}
            <Card>
              <CardHeader>
                <CardTitle>8. Modifications de la politique</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications entreront en vigueur dès leur publication sur cette page. Nous vous encourageons à consulter régulièrement cette page.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>9. Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, vous pouvez nous contacter :
                </p>
                <ul className="mt-4 space-y-2">
                  <li>
                    <strong>Email :</strong>{' '}
                    <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">
                      {COMPANY_INFO.email}
                    </a>
                  </li>
                  <li>
                    <strong>Téléphone :</strong> {COMPANY_INFO.phone}
                  </li>
                  <li>
                    <strong>Adresse :</strong> Les Mureaux, France
                  
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Date de mise à jour */}
            <Card>
              <CardHeader>
                <CardTitle>Date de dernière mise à jour</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Cette politique de confidentialité a été mise à jour le {new Date().toLocaleDateString('fr-FR')}.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Privacy