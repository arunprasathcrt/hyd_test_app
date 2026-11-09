import {z} from 'zod';
import {createLogger} from '~/lib/logger';
import {METAOBJECT_TYPES, PROGRAM_CODE_FIELDS} from '~/shared/constants/metafields';

const log = createLogger('metaobjects.program-codes');

const metaobjectListSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      handle: z.string(),
      fields: z.array(z.object({key: z.string(), value: z.string().nullable()})),
    }),
  ),
});

const programCodeListsResponseSchema = z.object({
  programCodes: metaobjectListSchema,
  programCodes2: metaobjectListSchema,
});

type ProgramCodeList = z.infer<typeof metaobjectListSchema>;

function readCodes(list: ProgramCodeList, type: string): Array<{id: string; code: string}> {
  if (!list.nodes.length) {
    log.warn('No program-code metaobjects returned; check Storefront access', {type});
  }

  const seen = new Set<string>();
  return list.nodes.flatMap((node) => {
    const value = node.fields
      .find((field) => field.key === PROGRAM_CODE_FIELDS.code)
      ?.value?.trim();
    if (!value) {
      log.warn('Program-code metaobject is missing its code field', {
        type,
        handle: node.handle,
      });
      return [];
    }

    const normalized = value.toLowerCase();
    if (seen.has(normalized)) return [];
    seen.add(normalized);
    return [{id: node.id, code: value}];
  });
}

export function readProgramCodeLists(payload: unknown): {
  programCodes: Array<{id: string; code: string}>;
  programCodes2: Array<{id: string; code: string}>;
} {
  const parsed = programCodeListsResponseSchema.safeParse(payload);
  if (!parsed.success) {
    log.warn('Program-code metaobject payload did not parse', {
      issues: parsed.error.issues.map((issue) => issue.path.join('.')),
    });
    return {programCodes: [], programCodes2: []};
  }

  return {
    programCodes: readCodes(parsed.data.programCodes, METAOBJECT_TYPES.programCode),
    programCodes2: readCodes(parsed.data.programCodes2, METAOBJECT_TYPES.programCodeList2),
  };
}