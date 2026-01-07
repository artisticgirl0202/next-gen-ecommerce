from typing import Union
from pydantic import BaseModel, Field
from pydantic import ConfigDict  # pydantic v2
class InteractRequest(BaseModel):
    user_id: int
    product_id: int
    event: str = "view"

class InteractionCreate(BaseModel):
    # Union을 사용하여 "1"이나 "ORD-MQHU" 모두 수용 가능하게 합니다.
    # Field(..., alias="userId")는 프론트의 camelCase를 백엔드의 snake_case로 매핑합니다.
    user_id: Union[int, str] = Field(..., alias="userId")
    order_id: Union[int, str] = Field(..., alias="orderId")
    action: str

    # pydantic v2 방식으로 설정: alias와 field name(예: user_id) 둘 다 허용
    model_config = ConfigDict(populate_by_name=True)

