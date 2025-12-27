export default function Home() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>ProjectPulse</h1>
      <a href="/login" style={{ 
        display: 'inline-block', 
        marginTop: '20px', 
        padding: '10px 20px', 
        background: '#0070f3', 
        color: 'white', 
        textDecoration: 'none',
        borderRadius: '5px'
      }}>
        Go to Login
      </a>
    </div>
  );
}
