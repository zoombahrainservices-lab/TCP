import { DividerBlock as DividerBlockType } from '@/lib/blocks/types';

export default function DividerBlock({}: DividerBlockType) {
  return (
    <hr className="my-8 border-t-2 border-gray-200 dark:border-gray-700" />
  );
}
