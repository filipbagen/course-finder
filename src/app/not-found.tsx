export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="mt-32 text-center">
      <h2>404: Sidan kan inte hittas.</h2>
      <p>
        Vi kan inte hitta den sida du söker. Det kan bero på att sidan har
        flyttats, uppdaterats eller raderats. Använd vår sökfunktion eller gå
        tillbaka till startsidan för att hitta informationen du behöver.
      </p>
    </div>
  )
}
