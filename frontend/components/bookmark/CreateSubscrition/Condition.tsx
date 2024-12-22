import React, { useState } from "react";
import { Button, Select, SelectItem, Input, Spacer } from "@nextui-org/react";

interface Condition {
  id: number;
  operator: ">" | "<";
  value: string;
}

const ConditionBuilder: React.FC = () => {
  const [conditions, setConditions] = useState<Condition[]>([]);

  const addCondition = () => {
    if (conditions.length >= 2) {
      alert("You can only add up to two conditions.");
      return;
    }
    const newCondition: Condition = {
      id: Date.now(), // 使用時間戳作為唯一 ID
      operator: ">", // 默認為大於
      value: "",
    };
    setConditions([...conditions, newCondition]);
  };

  const updateCondition = (id: number, field: keyof Condition, value: any) => {
    setConditions((prevConditions) =>
      prevConditions.map((condition) =>
        condition.id === id ? { ...condition, [field]: value } : condition
      )
    );
  };

  const deleteCondition = (id: number) => {
    setConditions((prevConditions) =>
      prevConditions.filter((condition) => condition.id !== id)
    );
  };

  const getExpressionSummary = () => {
    if (conditions.length === 0) return "No conditions added.";
    return conditions
      .map((condition) => `${condition.operator} ${condition.value || "?"}`)
      .join(" OR ");
  };

  return (
    <div className="condition-builder">
      <h2 className="text-lg font-bold mb-4">Condition Builder</h2>
      <Button
        color="primary"
        onPress={addCondition}
        isDisabled={conditions.length >= 2}
      >
        Add Condition
      </Button>
      <Spacer y={1} />
      {conditions.map((condition) => (
        <div
          key={condition.id}
          className="flex items-center gap-4 mb-4 border p-4 rounded"
        >
          {/* 使用符號作為操作符 */}
          <Select
            aria-label="Operator"
            selectedKeys={[condition.operator]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as ">" | "<";
              updateCondition(condition.id, "operator", selected);
            }}
            size="sm"
          >
            <SelectItem key=">">&gt;</SelectItem>
            <SelectItem key="<">&lt;</SelectItem>
          </Select>
          <Input
            type="number"
            min={0}
            max={5}
            value={condition.value}
            isRequired
            onChange={(e) =>
              updateCondition(condition.id, "value", e.target.value)
            }
            fullWidth
          />
          <Button
            color="danger"
            onPress={() => deleteCondition(condition.id)}
          >
            Delete
          </Button>
        </div>
      ))}

      {/* 總結表達式 */}
      <p className="mt-4 text-gray-600">
        <strong>While rainfall index</strong> {getExpressionSummary()} <strong>alert me</strong>
      </p>
    </div>
  );
};

export default ConditionBuilder;
