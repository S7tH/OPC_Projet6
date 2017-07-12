<?php

namespace S7tH\DirectoryBundle\Entity;

//use an arraycollection for my categories
use Doctrine\Common\Collections\ArrayCollection;

//use doctrine annotation for my db
use Doctrine\ORM\Mapping as ORM;

//use annotation with alias Assert to fixe the valides rules
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Tricks
 *
 * @ORM\Table(name="tricks")
 * @ORM\Entity(repositoryClass="S7tH\DirectoryBundle\Repository\TricksRepository")
 */
class Tricks
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=40, unique=true)
     * @Assert\NotBlank()
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(name="description", type="text")
     * @Assert\NotBlank()
     */
    private $description;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="date", type="datetimetz")
     * @Assert\DateTime()
     */
    private $date;

    /**
     * @ORM\OneToOne(targetEntity="S7tH\DirectoryBundle\Entity\Image", cascade={"persist", "remove"})
     * @ORM\JoinColumn(nullable=false)
     * @Assert\Valid()
     */
    private $image;

    /**
     * @ORM\ManyToMany(targetEntity="S7tH\DirectoryBundle\Entity\Category", cascade={"persist"})
     * @ORM\JoinTable(name="tricks_category")
     * @Assert\Valid()
     */
    private $categories;



    /*methods*/

    public function __construct()
    {
        $this->date = new \Datetime();

        //we must defined our arrayCollection in the constructor
        $this->categories = new ArrayCollection();
    }

    /**
     * Get id
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set name
     *
     * @param string $name
     *
     * @return Tricks
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set description
     *
     * @param string $description
     *
     * @return Tricks
     */
    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Get description
     *
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * Set date
     *
     * @param \DateTime $date
     *
     * @return Tricks
     */
    public function setDate($date)
    {
        $this->date = $date;

        return $this;
    }

    /**
     * Get date
     *
     * @return \DateTime
     */
    public function getDate()
    {
        return $this->date;
    }

    /**
     * Set image
     *
     * @param \S7tH\DirectoryBundle\Entity\Image $image
     *
     * @return Tricks
     */
    public function setImage(\S7tH\DirectoryBundle\Entity\Image $image)
    {
        $this->image = $image;

        return $this;
    }

    /**
     * Get image
     *
     * @return \S7tH\DirectoryBundle\Entity\Image
     */
    public function getImage()
    {
        return $this->image;
    }

    public function addCategory(Category $category)
    {
        //we use here the arrayCollection like a table
        {
            $this->categories[] = $category;
        }
    }

    public function removeCategory(Category $category)
    {
        // here we use an ArrayCollection method for delete the targeted category
        $this->categories->removeElement($category);
    }

    //recover a list of categories
    public function getCategories()
    {
        return $this->categories;
    }
}
