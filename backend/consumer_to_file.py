# -*- coding: utf-8 -*-

import asyncio
import os
import json
import logging
from aiokafka import AIOKafkaConsumer
from aiokafka.errors import KafkaConnectionError, GroupCoordinatorNotAvailableError, KafkaError


# 濡쒓퉭 ?占쎌젙 (print ?占
from backend.schemas.events.order_events import OrderCreatedEvent

def handle_message(raw):
    event = OrderCreatedEvent(**raw)

    assert event.type == "order.created"
