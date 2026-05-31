export default function Loading({ text = 'Loading...' }) {
  return (
    <div className="loading">
      <p>{text}</p>
    </div>
  )
}
