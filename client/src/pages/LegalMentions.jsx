import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { COMPANY_INFO } from '@/lib/constants'

function LegalMentions() {
  return (
    <div className="py-16">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-4xl font-bold">Mentions Légales</h1>

          <div className="space-y-6">
            {/* Éditeur du site */}
            <Card>
              <CardHeader>
                <CardTitle>Éditeur du site</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>Raison sociale :</strong> {COMPANY_INFO.name}
                </p>
                <p>
                  <strong>Adresse : </strong> Les Mureaux ,France 
                </p>
                <p>
                  <strong>Email :</strong>{' '}
                  <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">
                    {COMPANY_INFO.email}
                  </a>
                </p>
                <p>
                  <strong>Téléphone :</strong> {COMPANY_INFO.phone}
                </p>
                <p>
                  <strong>Site web :</strong> {COMPANY_INFO.domain}
                </p>
              </CardContent>
            </Card>

            {/* Directeur de publication */}
            <Card>
              <CardHeader>
                <CardTitle>Directeur de la publication</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Le directeur de la publication du site est EL ALAOUY Wessam.</p>
              </CardContent>
            </Card>

            {/* Hébergement */}
            <Card>
              <CardHeader>
                <CardTitle>Hébergement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>Le site est hébergé par IONOS:</p>
                <p>
                  <strong>Nom de l'hébergeur :</strong> Groupe IONOS SE
                </p>
                <p>
                  <strong>Adresse :</strong> [FR-DC]
                </p>
                <p>
                  <strong>Site web :</strong> [IONOS Website]
                </p>
              </CardContent>
            </Card>

            {/* Propriété intellectuelle */}
            <Card>
              <CardHeader>
                <CardTitle>Propriété intellectuelle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                </p>
                <p>
                  La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
                </p>
              </CardContent>
            </Card>

            {/* Liens hypertextes */}
            <Card>
              <CardHeader>
                <CardTitle>Liens hypertextes</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Les liens hypertextes mis en œuvre au sein du présent site internet, en direction d'autres sites et/ou de pages personnelles et d'une manière générale vers toutes ressources existantes sur Internet, ne sauraient engager la responsabilité de {COMPANY_INFO.name}.
                </p>
              </CardContent>
            </Card>

            {/* Limitations de responsabilité */}
            <Card>
              <CardHeader>
                <CardTitle>Limitations de responsabilité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  {COMPANY_INFO.name} ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site, et résultant soit de l'utilisation d'un matériel ne répondant pas aux spécifications indiquées, soit de l'apparition d'un bug ou d'une incompatibilité.
                </p>
                <p>
                  {COMPANY_INFO.name} ne pourra également être tenu responsable des dommages indirects (tels par exemple qu'une perte de marché ou perte d'une chance) consécutifs à l'utilisation du site.
                </p>
              </CardContent>
            </Card>

            {/* Litiges */}
            <Card>
              <CardHeader>
                <CardTitle>Litiges</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Les présentes conditions du site sont régies par les lois françaises et toute contestation ou litiges qui pourraient naître de l'interprétation ou de l'exécution de celles-ci seront de la compétence exclusive des tribunaux dont dépend le siège social de la société.
                </p>
              </CardContent>
            </Card>

            {/* Date de mise à jour */}
            <Card>
              <CardHeader>
                <CardTitle>Date de dernière mise à jour</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Les présentes mentions légales ont été mises à jour le {new Date().toLocaleDateString('fr-FR')}.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LegalMentions