class OrderEvent(Base):
    __tablename__ = "order_events"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, index=True)
    event_type = Column(String)
    payload = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
