import type { TCourse } from '@/types/course';

import { Badge, Box, Button, HStack, Text, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';

import { getCourseInfo, getCourseList } from '@/axios/course';
import { getUser } from '@/axios/user';
import { getDisabledStatus } from '@/utils';

export const Course: React.VFC<{
  hasTimer: boolean;
  setTimer: (func: any, timeout?: number) => void;
  clearTimer: () => void;
}> = ({ hasTimer, setTimer, clearTimer }) => {
  const [activeId, setActiveId] = useState<number>();
  const toast = useToast();
  const { data: list } = useQuery('course', () => {
    return getCourseList();
  });
  const { refetch, data: user } = useQuery('user', () => {
    return getUser();
  });

  useEffect(() => {
    if (!hasTimer) {
      setActiveId(undefined);
    }
  }, [hasTimer]);

  const timerFunc = async (id: number) => {
    try {
      const resp = await getCourseInfo(id);

      if (resp.data) {
        const info = resp.data;
        refetch();
        toast({
          description: `获得经验${info.exp}，健康值受损${info.damage}`,
          position: 'top-right',
          status: 'success',
          duration: 1500,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onStartLearn = (item: TCourse) => {
    if (activeId === item.id && hasTimer) {
      clearTimer();
      setActiveId(undefined);
      return;
    }

    toast({
      title: `正在学习：${item.name}`,
      description: '已取消上一个任务',
      position: 'top-right',
      duration: 3000,
    });
    setActiveId(item.id);
    setTimer(() => {
      timerFunc(item.id);
    }, item.timeout * 1000);
  };

  if (!list || !user) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {list.map((item) => (
        <Box key={item.id} borderWidth="1px" borderRadius="lg" p={2}>
          <Text>
            <Badge mr={1} colorScheme="blue">
              课程名：
            </Badge>
            <Badge>{item.name}</Badge>
          </Text>
          <Text>
            <Badge mr={1} colorScheme="blue">
              需要经验：
            </Badge>
            <Badge>{item.limit}</Badge>
          </Text>
          <Text>
            <Badge mr={1} colorScheme="blue">
              每{item.timeout}秒可获得经验：
            </Badge>
            <Badge>
              {item.exp.min}-{item.exp.max}
            </Badge>
          </Text>
          <Text>
            <Badge mr={1} colorScheme="blue">
              每{item.timeout}秒会影响健康：
            </Badge>
            <Badge>
              {item.damage.min}-{item.damage.max}
            </Badge>
          </Text>

          <HStack justify="end">
            <Button
              colorScheme="blue"
              disabled={getDisabledStatus(user, item)}
              isLoading={activeId === item.id}
              onClick={() => onStartLearn(item)}
              loadingText="取消学习"
            >
              开始学习
            </Button>
          </HStack>
        </Box>
      ))}
    </Box>
  );
};
