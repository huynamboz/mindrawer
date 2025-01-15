import { defaultObjectOptions } from './fabric';

// console.log('defaultObjectOptions', defaultObjectOptions);
export function getAdditionalObjectKey() {
  const additionalProperties = Array.from(new Set([
    'id',
    'lineIds',
    'groupId',
    'midPointId',
    'pointIds',
    'hasControls',
    'hasBorders',
    'pos',
    'customType',
    'visible',
    'targetFindTolerance',
    'uniformScaling',
    'renderOnAddRemove',
    'preserveObjectStacking',
    'selectionFullyContained',
    ...Object.keys(defaultObjectOptions),
  ]));

  return additionalProperties;
}
