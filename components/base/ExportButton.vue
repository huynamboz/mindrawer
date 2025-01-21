<script setup lang="ts">
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { exportObjectSelected } from '~/utils/fabric/fabric';

const types = ref<Array<'jpeg' | 'png'>>(['jpeg', 'png']);
const currentType = ref<'jpeg' | 'png'>(types.value[0]);
</script>

<template>
  <div class="text-xs">
    <Popover>
      <PopoverTrigger>
        <Button class="text-sm h-7">
          Export
        </Button>
      </PopoverTrigger>
      <PopoverContent class="text-sm rounded-xl p-3">
        <p class="block border-b pb-2">
          Download
        </p>

        <p class="text-xs mt-4 mb-2 text-gray-600">
          File type
        </p>
        <Select v-model="currentType">
          <SelectTrigger>
            <SelectValue placeholder="Select a file type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="type in types"
              :key="type"
              :value="type"
            >
              {{ type }}
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- note -->
        <p class="text-xs mt-4 mb-2 text-gray-600">
          Notice: If you don't select any object, all objects will be exported.
        </p>
        <Button
          class="mt-4 w-full"
          @click="exportObjectSelected(currentType)"
        >
          Export selected
        </Button>
      </PopoverContent>
    </Popover>
  </div>
</template>
