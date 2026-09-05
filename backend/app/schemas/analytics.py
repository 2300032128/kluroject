from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class OverviewMetrics(BaseModel):
    total_doubts: int
    ai_resolved_count: int
    escalated_count: int
    ai_resolution_rate: float
    contradiction_alerts_count: int
    active_clusters_count: int
    demo_mode: bool

class DoubtClusterSchema(BaseModel):
    id: str
    syllabus_node_id: Optional[str]
    cluster_title: str
    module_name: str
    doubt_count: int
    key_misconceptions: List[str]
    suggested_action: str

class ContradictionAlertSchema(BaseModel):
    id: str
    topic_name: str
    source_a_title: str
    source_a_quote: str
    source_b_title: str
    source_b_quote: str
    explanation: str
    severity: str
    created_at: datetime
