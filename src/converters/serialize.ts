import { FIELDS_METADATA_KEY } from "../metadata/metadata.keys";
import { FieldMetadata } from "../field/field.metadata";
import { NoFieldsError } from "../errors";
import { parseJsonPropertyName, setPropertyToJson } from "./json-utils";
import "reflect-metadata";
import { isPresent } from "../serializers/field.utils";
import { getMetadata } from "../metadata/get-metadata";

/**
 * Convert model to json with metadata names
 *
 * Fields that not are labeled as {@link Field} will be ignore
 *
 * @param {Object} model Serializable model that was convert to json
 * @returns {Object} Server object
 */
export function serialize(model: { [key: string]: any }): Object {
  const modelPrototype = Object.getPrototypeOf(model);
  const fields = getMetadata(modelPrototype);

  if (fields.length === 0) {
    throw new NoFieldsError();
  }

  // Convert array of field metadata to json object
  return fields.reduce(
    (previousValue: { [k: string]: any }, currentValue: FieldMetadata) => {
      const address = parseJsonPropertyName(<string>(
        currentValue.jsonPropertyName
      ));

      const modelValue = model[currentValue.modelPropertyName];
      if (isPresent(modelValue)) {
        const serializedModelValue = currentValue.serializer.serialize(
          modelValue
        );
        setPropertyToJson(previousValue, address, serializedModelValue);
      }

      return previousValue;
    },
    {}
  );
}
