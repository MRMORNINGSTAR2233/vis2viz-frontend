"""
FastAPI agent for exposing the multi-agent system as a REST API.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import json
import plotly.io as pio

from agents.orchestrator import Orchestrator

# Initialize the FastAPI app
app = FastAPI(title="Visual Data API", description="API for transforming natural language queries into visual data")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the orchestrator
orchestrator = Orchestrator()

# Define request and response models
class QueryRequest(BaseModel):
    query: str
    reset_context: bool = False

class QueryResponse(BaseModel):
    query: str
    sql_query: str
    data: Optional[List[Dict[str, Any]]] = None
    row_count: Optional[int] = None
    visualization_spec: Optional[Dict[str, Any]] = None
    visualization_html: Optional[str] = None
    visualization_json: Optional[Dict[str, Any]] = None
    success: bool
    error: Optional[str] = None

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Visual Data API is running",
        "docs": "/docs",
        "endpoints": [
            "/api/query",
            "/api/schema"
        ]
    }

@app.post("/api/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """
    Process a natural language query and return visualization.
    
    Args:
        request: QueryRequest object containing the query and reset_context flag
        
    Returns:
        QueryResponse object with the results
    """
    try:
        # Reset conversation context if requested
        if request.reset_context:
            orchestrator.reset_conversation()
        
        # Process the query
        result = orchestrator.process(request.query)
        
        if not result["success"]:
            return QueryResponse(
                query=request.query,
                sql_query=result.get("sql_query", ""),
                success=False,
                error=result.get("error", "Unknown error occurred")
            )
        
        # Extract query results
        query_result = result.get("query_result", {})
        data = query_result.get("data", [])
        row_count = query_result.get("row_count", 0)
        
        # Extract visualization
        visualization = result.get("visualization", {})
        visualization_spec = result.get("visualization_spec", {})
        
        # Convert Plotly figure to HTML and JSON
        fig = visualization.get("figure")
        visualization_html = None
        visualization_json = None
        
        if fig:
            # Convert to HTML
            visualization_html = pio.to_html(fig, full_html=False, include_plotlyjs='cdn')
            
            # Use the pre-generated JSON if available, otherwise convert
            visualization_json = visualization.get("figure_json", json.loads(pio.to_json(fig)))
        
        # Return the response
        return QueryResponse(
            query=request.query,
            sql_query=result["sql_query"],
            data=data,
            row_count=row_count,
            visualization_spec=visualization_spec,
            visualization_html=visualization_html,
            visualization_json=visualization_json,
            success=True,
            error=None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/schema")
async def get_schema():
    """Get database schema."""
    try:
        schema = orchestrator.get_schema()
        return {"schema": schema}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
