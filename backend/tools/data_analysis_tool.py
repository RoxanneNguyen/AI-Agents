"""
Data Analysis Tool - Data processing and visualization capabilities
Uses Pandas, NumPy, and Plotly
"""

from typing import Optional, Dict, Any, List, Union
import json
import io
import base64
from loguru import logger

from agno.tools import Toolkit, tool


class DataAnalysisToolkit(Toolkit):
    """
    Data Analysis toolkit for processing and visualizing data.
    
    Capabilities:
    - Load data from various formats (CSV, JSON, Excel)
    - Perform statistical analysis
    - Create visualizations
    - Transform and clean data
    """
    
    def __init__(self):
        super().__init__(name="data_analysis")
        self.dataframes: Dict[str, Any] = {}  # Store loaded dataframes
        
        # Register tools
        self.register(self.load_csv)
        self.register(self.load_json_data)
        self.register(self.analyze_data)
        self.register(self.create_chart)
        self.register(self.filter_data)
        self.register(self.aggregate_data)
        self.register(self.describe_data)
        self.register(self.transform_data)
        self.register(self.export_data)
    
    @tool(description="Load data from a CSV file or CSV content. Returns a summary of the loaded data.")
    def load_csv(self, source: str, name: str = "default") -> str:
        """
        Load CSV data from a file path or raw CSV content.
        
        Args:
            source: File path or raw CSV content
            name: Name to reference this dataset
        
        Returns:
            Summary of the loaded data
        """
        import pandas as pd
        
        try:
            # Check if source is a file path or raw content
            if source.endswith('.csv') or '/' in source or '\\' in source:
                df = pd.read_csv(source)
            else:
                df = pd.read_csv(io.StringIO(source))
            
            self.dataframes[name] = df
            
            summary = {
                "name": name,
                "shape": {"rows": len(df), "columns": len(df.columns)},
                "columns": list(df.columns),
                "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
                "preview": df.head(5).to_dict(orient="records"),
                "null_counts": df.isnull().sum().to_dict()
            }
            
            logger.info(f"📊 Loaded CSV '{name}' with {len(df)} rows")
            return json.dumps(summary, indent=2, default=str)
            
        except Exception as e:
            logger.error(f"Error loading CSV: {e}")
            return json.dumps({"error": str(e)})
    
    @tool(description="Load data from JSON format.")
    def load_json_data(self, data: str, name: str = "default") -> str:
        """
        Load JSON data into a dataframe.
        
        Args:
            data: JSON string or file path
            name: Name to reference this dataset
        
        Returns:
            Summary of the loaded data
        """
        import pandas as pd
        
        try:
            if data.endswith('.json') or '/' in data or '\\' in data:
                df = pd.read_json(data)
            else:
                parsed = json.loads(data)
                df = pd.DataFrame(parsed)
            
            self.dataframes[name] = df
            
            summary = {
                "name": name,
                "shape": {"rows": len(df), "columns": len(df.columns)},
                "columns": list(df.columns),
                "preview": df.head(5).to_dict(orient="records")
            }
            
            logger.info(f"📊 Loaded JSON '{name}' with {len(df)} rows")
            return json.dumps(summary, indent=2, default=str)
            
        except Exception as e:
            return json.dumps({"error": str(e)})
    
    @tool(description="Perform statistical analysis on a dataset. Returns statistics like mean, median, std, correlations.")
    def analyze_data(self, name: str = "default", columns: Optional[List[str]] = None) -> str:
        """
        Perform statistical analysis on the data.
        
        Args:
            name: Dataset name
            columns: Specific columns to analyze (optional)
        
        Returns:
            Statistical analysis results
        """
        import pandas as pd
        import numpy as np
        
        if name not in self.dataframes:
            return json.dumps({"error": f"Dataset '{name}' not found"})
        
        df = self.dataframes[name]
        
        if columns:
            df = df[columns]
        
        try:
            # Get numeric columns
            numeric_df = df.select_dtypes(include=[np.number])
            
            analysis = {
                "dataset": name,
                "total_rows": len(df),
                "total_columns": len(df.columns),
                "numeric_columns": list(numeric_df.columns),
                "categorical_columns": list(df.select_dtypes(include=['object']).columns),
                "statistics": {},
                "correlations": {}
            }
            
            # Calculate statistics for numeric columns
            if not numeric_df.empty:
                stats = numeric_df.describe().to_dict()
                analysis["statistics"] = stats
                
                # Calculate correlations
                if len(numeric_df.columns) > 1:
                    corr = numeric_df.corr().to_dict()
                    analysis["correlations"] = corr
            
            # Value counts for categorical columns
            cat_columns = df.select_dtypes(include=['object']).columns
            analysis["categorical_summary"] = {}
            for col in cat_columns[:5]:  # Limit to first 5 categorical columns
                analysis["categorical_summary"][col] = df[col].value_counts().head(10).to_dict()
            
            logger.info(f"📈 Analyzed dataset '{name}'")
            return json.dumps(analysis, indent=2, default=str)
            
        except Exception as e:
            return json.dumps({"error": str(e)})
    
    @tool(description="Create a chart/visualization from data. Supports bar, line, scatter, pie, histogram charts.")
    def create_chart(
        self,
        chart_type: str,
        name: str = "default",
        x_column: Optional[str] = None,
        y_column: Optional[str] = None,
        title: str = "Chart",
        color_column: Optional[str] = None
    ) -> str:
        """
        Create a chart visualization.
        
        Args:
            chart_type: Type of chart (bar, line, scatter, pie, histogram, box)
            name: Dataset name
            x_column: Column for x-axis
            y_column: Column for y-axis
            title: Chart title
            color_column: Column for color grouping (optional)
        
        Returns:
            Chart data in JSON format (Plotly spec)
        """
        import plotly.express as px
        import plotly.graph_objects as go
        
        if name not in self.dataframes:
            return json.dumps({"error": f"Dataset '{name}' not found"})
        
        df = self.dataframes[name]
        
        try:
            fig = None
            
            if chart_type == "bar":
                fig = px.bar(df, x=x_column, y=y_column, title=title, color=color_column)
            elif chart_type == "line":
                fig = px.line(df, x=x_column, y=y_column, title=title, color=color_column)
            elif chart_type == "scatter":
                fig = px.scatter(df, x=x_column, y=y_column, title=title, color=color_column)
            elif chart_type == "pie":
                fig = px.pie(df, names=x_column, values=y_column, title=title)
            elif chart_type == "histogram":
                fig = px.histogram(df, x=x_column, title=title, color=color_column)
            elif chart_type == "box":
                fig = px.box(df, x=x_column, y=y_column, title=title, color=color_column)
            else:
                return json.dumps({"error": f"Unknown chart type: {chart_type}"})
            
            # Convert to JSON
            chart_json = fig.to_json()
            
            logger.info(f"📊 Created {chart_type} chart: {title}")
            return chart_json
            
        except Exception as e:
            return json.dumps({"error": str(e)})
    
    @tool(description="Filter data based on conditions.")
    def filter_data(
        self,
        name: str,
        conditions: str,
        output_name: Optional[str] = None
    ) -> str:
        """
        Filter data based on conditions.
        
        Args:
            name: Dataset name
            conditions: Pandas query string (e.g., "age > 30 and salary < 50000")
            output_name: Name for filtered dataset (optional)
        
        Returns:
            Summary of filtered data
        """
        import pandas as pd
        
        if name not in self.dataframes:
            return json.dumps({"error": f"Dataset '{name}' not found"})
        
        df = self.dataframes[name]
        
        try:
            filtered_df = df.query(conditions)
            
            if output_name:
                self.dataframes[output_name] = filtered_df
            
            result = {
                "original_rows": len(df),
                "filtered_rows": len(filtered_df),
                "conditions": conditions,
                "preview": filtered_df.head(10).to_dict(orient="records")
            }
            
            if output_name:
                result["saved_as"] = output_name
            
            logger.info(f"🔍 Filtered '{name}': {len(df)} → {len(filtered_df)} rows")
            return json.dumps(result, indent=2, default=str)
            
        except Exception as e:
            return json.dumps({"error": str(e)})
    
    @tool(description="Aggregate data with groupby operations.")
    def aggregate_data(
        self,
        name: str,
        group_by: List[str],
        aggregations: Dict[str, str],
        output_name: Optional[str] = None
    ) -> str:
        """
        Aggregate data using groupby.
        
        Args:
            name: Dataset name
            group_by: Columns to group by
            aggregations: Dict of column: aggregation function (sum, mean, count, min, max)
            output_name: Name for aggregated dataset (optional)
        
        Returns:
            Aggregated data summary
        """
        import pandas as pd
        
        if name not in self.dataframes:
            return json.dumps({"error": f"Dataset '{name}' not found"})
        
        df = self.dataframes[name]
        
        try:
            agg_df = df.groupby(group_by).agg(aggregations).reset_index()
            
            if output_name:
                self.dataframes[output_name] = agg_df
            
            result = {
                "group_by": group_by,
                "aggregations": aggregations,
                "result_rows": len(agg_df),
                "data": agg_df.to_dict(orient="records")
            }
            
            logger.info(f"📊 Aggregated '{name}' by {group_by}")
            return json.dumps(result, indent=2, default=str)
            
        except Exception as e:
            return json.dumps({"error": str(e)})
    
    @tool(description="Get a detailed description of a dataset including data types, null values, and sample values.")
    def describe_data(self, name: str = "default") -> str:
        """
        Get detailed description of a dataset.
        
        Args:
            name: Dataset name
        
        Returns:
            Detailed data description
        """
        import pandas as pd
        
        if name not in self.dataframes:
            return json.dumps({"error": f"Dataset '{name}' not found"})
        
        df = self.dataframes[name]
        
        try:
            description = {
                "name": name,
                "shape": {"rows": len(df), "columns": len(df.columns)},
                "memory_usage_mb": df.memory_usage(deep=True).sum() / 1024 / 1024,
                "columns": []
            }
            
            for col in df.columns:
                col_info = {
                    "name": col,
                    "dtype": str(df[col].dtype),
                    "null_count": int(df[col].isnull().sum()),
                    "null_percentage": round(df[col].isnull().sum() / len(df) * 100, 2),
                    "unique_count": int(df[col].nunique()),
                    "sample_values": df[col].dropna().head(3).tolist()
                }
                description["columns"].append(col_info)
            
            return json.dumps(description, indent=2, default=str)
            
        except Exception as e:
            return json.dumps({"error": str(e)})
    
    @tool(description="Transform data: rename columns, create new columns, or apply functions.")
    def transform_data(
        self,
        name: str,
        operations: List[Dict[str, Any]],
        output_name: Optional[str] = None
    ) -> str:
        """
        Transform data with various operations.
        
        Args:
            name: Dataset name
            operations: List of operations:
                - {"type": "rename", "old": "col1", "new": "new_col1"}
                - {"type": "drop", "columns": ["col1", "col2"]}
                - {"type": "fillna", "column": "col1", "value": 0}
                - {"type": "astype", "column": "col1", "dtype": "int"}
            output_name: Name for transformed dataset
        
        Returns:
            Summary of transformations
        """
        import pandas as pd
        
        if name not in self.dataframes:
            return json.dumps({"error": f"Dataset '{name}' not found"})
        
        df = self.dataframes[name].copy()
        results = []
        
        try:
            for op in operations:
                op_type = op.get("type")
                
                if op_type == "rename":
                    df = df.rename(columns={op["old"]: op["new"]})
                    results.append(f"Renamed '{op['old']}' to '{op['new']}'")
                
                elif op_type == "drop":
                    df = df.drop(columns=op["columns"])
                    results.append(f"Dropped columns: {op['columns']}")
                
                elif op_type == "fillna":
                    df[op["column"]] = df[op["column"]].fillna(op["value"])
                    results.append(f"Filled NA in '{op['column']}' with {op['value']}")
                
                elif op_type == "astype":
                    df[op["column"]] = df[op["column"]].astype(op["dtype"])
                    results.append(f"Changed '{op['column']}' type to {op['dtype']}")
            
            if output_name:
                self.dataframes[output_name] = df
            else:
                self.dataframes[name] = df
            
            return json.dumps({
                "operations_applied": results,
                "new_shape": {"rows": len(df), "columns": len(df.columns)},
                "saved_as": output_name or name
            }, indent=2)
            
        except Exception as e:
            return json.dumps({"error": str(e)})
    
    @tool(description="Export data to various formats (CSV, JSON).")
    def export_data(self, name: str, format: str = "csv") -> str:
        """
        Export data to a specified format.
        
        Args:
            name: Dataset name
            format: Output format (csv, json)
        
        Returns:
            Exported data as string
        """
        if name not in self.dataframes:
            return json.dumps({"error": f"Dataset '{name}' not found"})
        
        df = self.dataframes[name]
        
        try:
            if format == "csv":
                return df.to_csv(index=False)
            elif format == "json":
                return df.to_json(orient="records", indent=2)
            else:
                return json.dumps({"error": f"Unknown format: {format}"})
                
        except Exception as e:
            return json.dumps({"error": str(e)})
