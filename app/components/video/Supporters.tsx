import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDTSol } from '@/lib/utils';
import { DEFAULT_AVATAR } from '@/lib/constants';

const Supporters = ({ supporters }: { supporters: Array<{ id: number | string; name: string; image?: string | null; amount: number | string }> }) => {
    return (
        <Card className="w-full overflow-hidden py-0">
            <CardHeader className="rounded-t-xl bg-muted px-3 py-2">
              <CardTitle className="text-sm font-semibold">Top Supporters</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
            <Table>
                <TableBody>
                    {supporters.map((user, index) => (
                        <TableRow key={user.id}>
                            <TableCell className="px-2 font-bold">{index + 1}</TableCell>
                            <TableCell>
                                <div className="flex items-center">
                                    <Avatar className="mr-2 size-6">
                                      <AvatarImage src={user.image || DEFAULT_AVATAR} alt={user.name} />
                                      <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
                                    </Avatar>
                                    {user.name.split(" ")[0]}
                                </div>
                            </TableCell>
                            <TableCell className="px-2 text-sm font-bold">{formatDTSol(Number(user.amount))} DTSol</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {supporters.length < 5 &&
                <div className="my-2 text-center text-sm font-light text-muted-foreground">
                    Support the channel to appear here
                </div>
            }
            </CardContent>
        </Card>
    )
}

export default Supporters
