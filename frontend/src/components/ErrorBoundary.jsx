import React from "react"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // If Vercel deployed a new version, old JS chunks are deleted. 
    // Auto-reload the page to fetch the new chunks.
    if (
      error &&
      error.message &&
      (error.message.includes("Failed to fetch dynamically imported module") ||
        error.message.includes("Importing a module script failed"))
    ) {
      window.location.reload();
    }
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error("React ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "2rem",
            backgroundColor: "#330000",
            color: "#ff9999",
            minHeight: "100vh",
            fontFamily: "monospace",
          }}
        >
          <h2>Something went wrong in React!</h2>
          <details style={{ whiteSpace: "pre-wrap", marginTop: "1rem" }}>
            <summary>Click for error details</summary>
            <br />
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
