<?php

namespace S7tH\DirectoryBundle\Repository;

/**
 * TricksRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class TricksRepository extends \Doctrine\ORM\EntityRepository
{
    public function tricklist()
    {
        $queryBuilder = $this->createQueryBuilder('t');

        $queryBuilder->orderBy('t.category', 'ASC');
     
        return $queryBuilder
            ->getQuery()
            ->getResult();
    }
}
